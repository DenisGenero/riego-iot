/* MQTT (over TCP) Example

   This example code is in the Public Domain (or CC0 licensed, at your option.)

   Unless required by applicable law or agreed to in writing, this
   software is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
   CONDITIONS OF ANY KIND, either express or implied.
*/

#include <stdio.h>
#include <string.h>
#include "esp_wifi.h"
#include "esp_system.h"
#include "nvs_flash.h"
#include "esp_event.h"
#include "esp_netif.h"
#include "protocol_examples_common.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "esp_log.h"
#include "mqtt_client.h"
#include "driver/gpio.h"
//#include "ca_cert.h"

#define DEVICE_ID "esp01"
#define BROKER_URI "mqtt://3.128.92.91:1883"
//#define BROKER_URI "mqtt://3.128.92.91:8883"
#define USERNAME "denis"
#define PASSWORD "denis346"
#define LED_GPIO GPIO_NUM_2

static const char *TAG = "MQTT_APP";
esp_mqtt_client_handle_t client;

void send_fake_sensor_data() {
    char payload[100];
    snprintf(payload, sizeof(payload),
             "{ \"temperatura\": %.1f, \"presion\": %.1f }",
             23.5, 1013.2);
    char topic[64];
    snprintf(topic, sizeof(topic), "riego/%s/mediciones", DEVICE_ID);
    esp_mqtt_client_publish(client, topic, payload, 0, 1, 0);
    ESP_LOGI(TAG, "Medición publicada: %s -> %s", topic, payload);
}

void handle_valvula_command(const char *cmd) {
    if (strcmp(cmd, "OPEN") == 0) {
        gpio_set_level(LED_GPIO, 1);
        ESP_LOGI(TAG, "Válvula ABIERTA (LED encendido)");
    } else if (strcmp(cmd, "CLOSE") == 0) {
        gpio_set_level(LED_GPIO, 0);
        ESP_LOGI(TAG, "Válvula CERRADA (LED apagado)");
    } else {
        ESP_LOGW(TAG, "Comando desconocido: %s", cmd);
    }
}

static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id, void *event_data) {
    esp_mqtt_event_handle_t event = (esp_mqtt_event_handle_t)event_data;
    client = event->client;

    switch ((esp_mqtt_event_id_t)event_id) {
        case MQTT_EVENT_CONNECTED:
            ESP_LOGI(TAG, "MQTT conectado");
            {
                char topic[64];
                snprintf(topic, sizeof(topic), "riego/%s/valvula", DEVICE_ID);
                esp_mqtt_client_subscribe(client, topic, 1);
                send_fake_sensor_data();  // enviar una vez al conectar
            }
            break;
        case MQTT_EVENT_DATA:
            ESP_LOGI(TAG, "Mensaje recibido en %.*s: %.*s",
                     event->topic_len, event->topic,
                     event->data_len, event->data);
            handle_valvula_command(strndup(event->data, event->data_len));
            break;
        default:
            break;
    }
}

static void mqtt_app_start(void) {
    esp_mqtt_client_config_t mqtt_cfg = {
        .broker.address.uri = BROKER_URI,
        .credentials.username = USERNAME,
        .credentials.authentication.password = PASSWORD,
        //.broker.verification.certificate = (const char *)mqtt_cert_pem_start,
    };

    client = esp_mqtt_client_init(&mqtt_cfg);
    esp_mqtt_client_register_event(client, ESP_EVENT_ANY_ID, mqtt_event_handler, NULL);
    esp_mqtt_client_start(client);
}

void app_main(void) {
    ESP_LOGI(TAG, "Inicializando...");
    nvs_flash_init();
    esp_netif_init();
    esp_event_loop_create_default();
    example_connect();  // WiFi

    gpio_reset_pin(LED_GPIO);
    gpio_set_direction(LED_GPIO, GPIO_MODE_OUTPUT);

    mqtt_app_start();
}