/* MQTT Mutual Authentication Example */

#include <stdio.h>
#include <stdint.h>
#include <stddef.h>
#include <string.h>
#include "esp_wifi.h"
#include "esp_system.h"
#include "nvs_flash.h"
#include "esp_event.h"
#include "esp_netif.h"
#include "protocol_examples_common.h"
#include "time.h"

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#include "lwip/sockets.h"
#include "lwip/dns.h"
#include "lwip/netdb.h"

#include "esp_log.h"
#include "mqtt_client.h"

#include "driver/gpio.h"
#include "sdkconfig.h"

// ADC - Semilla para el rand
#include "esp_adc/adc_oneshot.h"
#include "esp_log.h"

// Librerías para el mbp280
/*
#include "bmp280.h"
#include "i2cdev"
*/
#define BROKER_URI "mqtts://3.128.92.91:8883"
#define DEVICE_ID "esp01"

static const char *TAG = "MQTTS_RIEGO";

// TLS certificados
extern const uint8_t client_cert_pem_start[] asm("_binary_client_crt_start");
extern const uint8_t client_cert_pem_end[]   asm("_binary_client_crt_end");
extern const uint8_t client_key_pem_start[]  asm("_binary_client_key_start");
extern const uint8_t client_key_pem_end[]    asm("_binary_client_key_end");
extern const uint8_t server_cert_pem_start[] asm("_binary_broker_CA_crt_start");
extern const uint8_t server_cert_pem_end[]   asm("_binary_broker_CA_crt_end");

static esp_mqtt_client_handle_t global_client = NULL;
// Pines para el I2C
//#define SDA_GPIO        21
//#define SCL_GPIO        22
// Pin Led para simular válvula
#define GPIO_VALVULA    2

// No se llegó a implementar, arroja error en lectura
/*
static bmp280_t bmp;

static void init_bmp280() {
    bmp280_params_t params;
    bmp280_init_default_params(&params);

    i2cdev_init();

    esp_err_t err = bmp280_init_desc(&bmp, BMP280_I2C_ADDRESS_0, 0, SDA_GPIO, SCL_GPIO);
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "bmp280_init_desc falló: %s", esp_err_to_name(err));
        return;
    }
    err = bmp280_init(&bmp, &params);
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "bmp280_init falló: %s", esp_err_to_name(err));
        return;
    }
    chip_id();

    float temperature, pressure;
    bmp280_force_measurement(&bmp);
    vTaskDelay(pdMS_TO_TICKS(100));
    bool ok = bmp280_read_float(&bmp, &temperature, &pressure, NULL);
    if (ok) {
        ESP_LOGI(TAG, "BMP280 inicializado - Temp: %.2f °C, Presión: %.2f hPa", temperature, pressure / 100);
    } else {
        ESP_LOGE(TAG, "Error leyendo datos iniciales del BMP280");
    }
}
*/

static void log_error_if_nonzero(const char *message, int error_code) {
    if (error_code != 0) {
        ESP_LOGE(TAG, "Last error %s: 0x%x", message, error_code);
    }
}

static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data) {
    esp_mqtt_event_handle_t event = event_data;
    esp_mqtt_client_handle_t client = event->client;
    static char topic_valvula[64];

    snprintf(topic_valvula, sizeof(topic_valvula), "riego/%s/valvula", DEVICE_ID);

    switch ((esp_mqtt_event_id_t)event_id) {
    case MQTT_EVENT_CONNECTED:
        ESP_LOGI(TAG, "MQTT_EVENT_CONNECTED");
        esp_mqtt_client_subscribe(client, topic_valvula, 1);
        break;

    case MQTT_EVENT_DATA:
        if (strncmp(event->data, "OPEN", event->data_len) == 0) {
            gpio_set_level(GPIO_VALVULA, 1);
            ESP_LOGI(TAG, "Abrir válvula");
        } else if (strncmp(event->data, "CLOSE", event->data_len) == 0) {
            gpio_set_level(GPIO_VALVULA, 0);
            ESP_LOGI(TAG, "Cerrar válvula");
        } else {
            ESP_LOGI(TAG, "Mensaje recibido: %.*s", event->data_len, event->data);
        }
        break;

    case MQTT_EVENT_ERROR:
        ESP_LOGI(TAG, "MQTT_EVENT_ERROR");
        if (event->error_handle->error_type == MQTT_ERROR_TYPE_TCP_TRANSPORT) {
            log_error_if_nonzero("esp-tls", event->error_handle->esp_tls_last_esp_err);
            log_error_if_nonzero("tls stack", event->error_handle->esp_tls_stack_err);
            log_error_if_nonzero("errno", event->error_handle->esp_transport_sock_errno);
        }
        break;

    default:
        ESP_LOGI(TAG, "Event ID: %d", event->event_id);
        break;
    }
}

// Se inicializa semilla para rand
void sensor_init(){

    adc_oneshot_unit_handle_t adc_handle;
    adc_oneshot_unit_init_cfg_t unit_cfg = {
        .unit_id = ADC_UNIT_1
    };

    adc_oneshot_new_unit(&unit_cfg, &adc_handle);

    int raw;
    esp_err_t err = adc_oneshot_read(adc_handle, ADC_CHANNEL_3, &raw);
    if (err != ESP_OK) {
        ESP_LOGE("SENSOR", "Error al leer el ADC: %s", esp_err_to_name(err));
    } else {
        ESP_LOGI("SENSOR", "Semilla generada con ADC: %d", raw);
    }

    srand((unsigned int) raw);  // Usar la lectura como semilla

    adc_oneshot_del_unit(adc_handle);  // Liberar ADC
}

bool sensor_read(float *temp, float *pres){
    // Se devuelve una temperatura aleatoria, entre 10 y 40 °C
    *temp = 10.0 + ((float)rand() / RAND_MAX) * (40.0 - 10.0);
    // Se devuelve una presión aleatoria entre 990 y 1025 HPa
    *pres = 990.0 + ((float)rand() / RAND_MAX) * (1025.0 - 990.0);
    return true;
}

static void publish_task(void *pvParameters) {
    char topic[64];
    char payload[64];
    snprintf(topic, sizeof(topic), "riego/%s/mediciones", DEVICE_ID);
    sensor_init();

    while (1) {
        float temperatura, presion;
        //bool ok = bmp280_read_float(&bmp, &temperature, &pressure, NULL);
        bool ok = sensor_read(&temperatura, &presion);
        if (ok) {
            //pressure /= 100.0; // Pa a hPa
            snprintf(payload, sizeof(payload), "{\"presion\":%.2f,\"temperatura\":%.2f}", presion, temperatura);
            esp_mqtt_client_publish(global_client, topic, payload, 0, 1, 0);
            ESP_LOGI(TAG, "Publicado: %s => %s", topic, payload);
        } else {
            ESP_LOGW(TAG, "Error leyendo datos del BMP280");
        }

        vTaskDelay(pdMS_TO_TICKS(1*60000)); // 1 minuto
    }
}

static void mqtt_app_start(void) {
    const esp_mqtt_client_config_t mqtt_cfg = {
        .broker.address.uri = BROKER_URI,
        .broker.verification.certificate = (const char *)server_cert_pem_start,
        .credentials.authentication.certificate = (const char *)client_cert_pem_start,
        .credentials.authentication.key = (const char *)client_key_pem_start,
    };

    global_client = esp_mqtt_client_init(&mqtt_cfg);
    esp_mqtt_client_register_event(global_client, ESP_EVENT_ANY_ID, mqtt_event_handler, NULL);
    esp_mqtt_client_start(global_client);

    xTaskCreate(&publish_task, "publish_task", 4096, NULL, 5, NULL);
}

void app_main(void) {
    ESP_LOGI(TAG, "[APP] Startup..");
    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    ESP_ERROR_CHECK(example_connect());

    gpio_reset_pin(GPIO_VALVULA);
    gpio_set_direction(GPIO_VALVULA, GPIO_MODE_OUTPUT);

    //init_bmp280();
    mqtt_app_start();
}