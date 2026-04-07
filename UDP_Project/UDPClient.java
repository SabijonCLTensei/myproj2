import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;

public class UDPClient {

    public static void main(String[] args) {
        try {
            // Create socket
            DatagramSocket socket = new DatagramSocket();

            // Message to send
            String message = (args.length > 0) ? String.join(" ", args) : "Hello from UDP Client!";
            byte[] buffer = message.getBytes();

            // Get server address
            InetAddress serverAddress = InetAddress.getByName("localhost");

            // Create packet
            DatagramPacket packet =
                    new DatagramPacket(buffer, buffer.length, serverAddress, 1234);

            // Send packet to server
            socket.send(packet);
            System.out.println("Message sent to server.");

            // Receive response
            byte[] responseBuffer = new byte[1024];
            DatagramPacket responsePacket =
                    new DatagramPacket(responseBuffer, responseBuffer.length);

            socket.receive(responsePacket);

            String response =
                    new String(responsePacket.getData(), 0, responsePacket.getLength());

            System.out.println("Server response: " + response);

            socket.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}