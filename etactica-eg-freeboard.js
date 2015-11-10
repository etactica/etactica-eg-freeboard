/**
 * eTactica EG data api plugin for Freeboard.
 * Licensed under your choice of MIT, BSD2, Apache2, or ISC licenses, for greatest flexibility
 */

(function()
{

    freeboard.loadDatasourcePlugin({
        "type_name" : "etactica-eg-freeboard",
        "display_name" : "eTactica EG live data",
        "description": "Listen to the live MQTT data stream of an eTactica EG",
        "external_scripts" : [
            // Assumes paho mqtt js installed to freeboard!
            "js/paho/mqttws31.js"
        ],
        "settings" : [
            {
                "name" : "server",
                "display_name" : "EG name",
                "type": "text",
                "description" : "hostname/ip of your EG",
                "default_value" : "192.168.49.1",
                "required" : true
            },
            {
                "name" : "topic",
                "default_value" : "status/local/json/device/#",
                "required" : true
            }
        ],
        newInstance : function(settings, newInstanceCallback, updateCallback) {
            newInstanceCallback(new egDatasourcePlugin(settings, updateCallback));
        }
    });

    var egDatasourcePlugin = function(settings, updateCallback) {
        var self = this;
        var data = {};
        var currentSettings = settings;


        self.onSettingsChanged = function(newSettings) {
            client.disconnect();
            // No guarantee we'll reconnect to the same place.
            data = {};
            currentSettings = newSettings;
            wsDoConnect();
        }

        self.updateNow = function() {
            // Nothing to manually "refresh" for an MQTT plugin.
        }

        self.onDispose = function() {
            if (client.isConnected()) {
				client.disconnect();
			}
			client = {};
        }

        function wsDoConnect() {
            client.connect({
                onSuccess: wsConnected,
                onFailure: wsLostHandler
            });
        }

        function wsConnected() {
            client.subscribe(currentSettings.topic)
        }

        function wsLostHandler(robj) {
            if (!data["connection_lost"]) {
                data["connection_lost"] = 1;
            } else {
                data["connection_lost"] = data["connection_lost"] + 1;
            }
            setTimeout(wsDoConnect, 2000);
        }

        function wsOnMessage(message) {
            var topics = message.destinationName.split("/");
            var payload = JSON.parse(message.payloadString);
            if (!payload) {
                console.log("shouldn't happen!");
                return;
            }
            if (topics[3] === "device") {
                var devid = payload.hwc.deviceid;
                if (!data[devid]) {
                    data[devid] = {};
                }
                data[devid].msg = payload;
            }
            updateCallback(data);
        }

        var client = new Paho.MQTT.Client(currentSettings.server, 8083,
            "freeb-" + (Math.random() + 1).toString(36).substring(2,8));
        client.onConnectionLost = wsLostHandler;
        client.onMessageArrived = wsOnMessage;
        wsDoConnect();
    }

}());