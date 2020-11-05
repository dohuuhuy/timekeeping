const kafka = require("kafka-node");
const config = require("../config/kafka.config");

try {
  const Consumer = kafka.Consumer;
  const client = new kafka.KafkaClient({
    kafkaHost: config.kafkaHost,
  });

  let consumer = new Consumer(client, [], { fromOffset: true });

  var countriesTopic = "Topic1";
  consumer.addTopics([{ topic: countriesTopic, partition: 0, offset: 0 }], () =>
    console.log("topic " + countriesTopic + " added to consumer for listening")
  );

  consumer.on("message", async function (message) {
    console.log("kafka ", JSON.parse(message.value));
  });
  consumer.on("error", function (error) {
    //  handle error
    console.log("error", error);
  });
  consumer.connect();
} catch (error) {
  // catch error trace
  console.log(error);
}
