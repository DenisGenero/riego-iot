# The following four lines of boilerplate have to be in your project's CMakeLists
# in this exact order for cmake to work correctly
cmake_minimum_required(VERSION 3.5)

# (Not part of the boilerplate)
# This example uses an extra component for common functions such as Wi-Fi and Ethernet connection.
set(EXTRA_COMPONENT_DIRS $ENV{IDF_PATH}/examples/common_components/protocol_examples_common)

# Include additional components for BMP280
set(EXTRA_COMPONENT_DIRS
    $ENV{IDF_PATH}/examples/common_components/protocol_examples_common
    ${CMAKE_SOURCE_DIR}/components/i2cdev
    ${CMAKE_SOURCE_DIR}/components/bmp280
)

include($ENV{IDF_PATH}/tools/cmake/project.cmake)
project(mqtt_ssl_mutual_auth)

target_add_binary_data(${CMAKE_PROJECT_NAME}.elf "main/client.crt" TEXT)
target_add_binary_data(${CMAKE_PROJECT_NAME}.elf "main/client.key" TEXT)
target_add_binary_data(${CMAKE_PROJECT_NAME}.elf "main/broker_CA.crt" TEXT)
