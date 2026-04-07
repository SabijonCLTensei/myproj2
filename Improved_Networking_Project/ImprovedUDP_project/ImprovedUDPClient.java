import java.net.*;
import java.util.Scanner;

public class ImprovedUDPClient {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("=== Improved UDP Client ===");
        
        String serverIP = (args.length > 0) ? args[0] : "";
        if (serverIP.isEmpty()) {
            System.out.print("Enter server's IP address: ");
            serverIP = sc.nextLine();
        }

        int port = 1234;
        try (DatagramSocket socket = new DatagramSocket()) {
            InetAddress address = InetAddress.getByName(serverIP);

            System.out.print("Message to send: ");
            String message = sc.nextLine();
            byte[] msgBytes = message.getBytes();

            // Send to server
            DatagramPacket packet = new DatagramPacket(msgBytes, msgBytes.length, address, port);
            socket.send(packet);
            System.out.println("[SENT] Sending to " + serverIP + "...");

            // Receive response
            byte[] responseBuffer = new byte[2048];
            DatagramPacket responsePacket = new DatagramPacket(responseBuffer, responseBuffer.length);
            
            // Set a timeout so the client doesn't wait forever if server is offline
            socket.setSoTimeout(5000); 
            socket.receive(responsePacket);

            String response = new String(responsePacket.getData(), 0, responsePacket.getLength());
            System.out.println("[SERVER RESPONSE]: " + response);

        } catch (SocketTimeoutException e) {
            System.out.println("Error: Server did not respond within 5 seconds.");
        } catch (Exception e) {
            System.out.println("UDP Client error: " + e.getMessage());
        }
        sc.close();
    }
}
