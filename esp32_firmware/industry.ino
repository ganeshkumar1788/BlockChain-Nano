#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>
#include <mbedtls/md.h>

// ===== WIFI =====
const char* ssid = "Lohitaksh";
const char* password = "YOUR_PASSWORD"; // User to fill actual password

// ===== MQTT =====
const char* mqtt_server = "8aecf11e1e704f09b031844bccbf8b96.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "ESP32_01";
const char* mqtt_pass = "Lohitaksh123";

// ===== DEVICE =====
#define DEVICE_ID "ESP32_INDUSTRY"
#define PACKAGE_ID "PKG_001"
const char* secret = "secret123";

WiFiClientSecure espClient;
PubSubClient client(espClient);

// ===== FUNCTIONS =====
void connectWiFi();
void connectMQTT();
String generateSignature(String payload);

void setup() {
  Serial.begin(115200);

  connectWiFi();

  // Use setInsecure() for HiveMQ Cloud certificates on ESP32
  espClient.setInsecure(); 
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    connectMQTT();
  }
  client.loop();

  unsigned long timestamp = millis();

  // Payload: device_id + timestamp + secret
  String payload = String(DEVICE_ID) + String(timestamp) + secret;
  String signature = generateSignature(payload);

  String json = "{";
  json += "\"stage\":\"manufacture\",";
  json += "\"device_id\":\"" + String(DEVICE_ID) + "\",";
  json += "\"package_id\":\"" + String(PACKAGE_ID) + "\",";
  json += "\"timestamp\":" + String(timestamp) + ",";
  json += "\"signature\":\"" + signature + "\"";
  json += "}";

  client.publish("industry/package", json.c_str());

  Serial.println("[INDUSTRY] Sent:");
  Serial.println(json);

  delay(10000); // Send every 10 seconds
}

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Connected");
}

void connectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting to HiveMQ (Industry)...");
    if (client.connect("ESP32_Industry", mqtt_user, mqtt_pass)) {
      Serial.println("Connected");
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" - Retrying in 2s...");
      delay(2000);
    }
  }
}

String generateSignature(String payload) {
  byte hash[32];
  mbedtls_md_context_t ctx;
  mbedtls_md_init(&ctx);
  mbedtls_md_setup(&ctx, mbedtls_md_info_from_type(MBEDTLS_MD_SHA256), 0);
  mbedtls_md_starts(&ctx);
  mbedtls_md_update(&ctx, (const unsigned char*)payload.c_str(), payload.length());
  mbedtls_md_finish(&ctx, hash);
  mbedtls_md_free(&ctx);

  String result = "";
  for (int i = 0; i < 32; i++) {
    char buf[3];
    sprintf(buf, "%02x", hash[i]);
    result += buf;
  }
  return result;
}
