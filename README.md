# Freeboard plugin for eTactica EG live data

Very basic initial cut at providing a custom datasource for Freeboard,
providing the live data stream from an eTactica EG device.

Gauge style readings are easy to drill into with the datasource dialog,
but SenML readings are not currently remapped into "friendly" names.


# Requirements

paho mqtt js must be installed in `js/paho/mqttws31.js` relative to
your freeboard root.  Edit the `external_scripts` setting of the plugin
if you have this installed elsewhere.

