import pika


if __name__ == '__main__':
    connection = pika.BlockingConnection(pika.ConnectionParameters(host='localhost'))
    channel = connection.channel()
    channel.queue_declare(queue='projects')

    def callback(ch, method, properties, body):
        print(" [x] Received %r" % body)
        ch.basic_ack(delivery_tag=method.delivery_tag)

    channel.basic_consume(callback, queue='projects')
    print(' [*] Waiting for messages. To exit press CTRL+C')
    channel.start_consuming()




