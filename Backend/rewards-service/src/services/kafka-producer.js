const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'rewards-service',
  brokers: [process.env.KAFKA_BROKERS || 'localhost:9092']
});

const producer = kafka.producer();

module.exports = {
  connect: async () => await producer.connect(),
  sendSubmissionEvent: async (event) => {
    await producer.send({
      topic: 'data-submissions',
      messages: [{ value: JSON.stringify(event) }]
    });
  }
};
