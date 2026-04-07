import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;

public class UDPServer {

    public static void main(String[] args) {
        try {
            // Create socket at port 1234
            DatagramSocket socket = new DatagramSocket(1234);
            System.out.println("UDP Server is running...");

            // Create buffer to receive data
            byte[] buffer = new byte[1024];

            // Create packet object
            DatagramPacket packet = new DatagramPacket(buffer, buffer.length);

            // Wait for client message
            socket.receive(packet);

            // Convert received data to string
            String message = new String(packet.getData(), 0, packet.getLength());
            System.out.println("Message from client: " + message);

            // Get client information
            InetAddress clientAddress = packet.getAddress();
            int clientPort = packet.getPort();

            // Send response to client
            String response = "Message received!";
            byte[] responseData = response.getBytes();

            DatagramPacket responsePacket =
                    new DatagramPacket(responseData, responseData.length, clientAddress, clientPort);

            socket.send(responsePacket);

            socket.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
