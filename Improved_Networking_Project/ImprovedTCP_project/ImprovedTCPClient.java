import java.io.*;
import java.net.*;
import java.util.Scanner;

public class ImprovedTCPClient {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("=== Improved TCP Client ===");
        
        // Let the user input the IP or provide it in args
        String serverIP = (args.length > 0) ? args[0] : "";
        if (serverIP.isEmpty()) {
            System.out.print("Enter server's IP address (e.g., 192.168.1.5): ");
            serverIP = sc.nextLine();
        }

        int port = 1234;
        try (Socket socket = new Socket(serverIP, port);
             PrintWriter out = new PrintWriter(socket.getOutputStream(), true);
             BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream()))) {

            System.out.println("[CONNECTED] Connected to server: " + serverIP);

            System.out.print("Enter your message to send: ");
            String message = sc.nextLine();

            out.println(message);
            System.out.println("[SENT] Sending message...");

            String response = in.readLine();
            System.out.println("[SERVER RESPONSE]: " + response);

        } catch (UnknownHostException e) {
            System.out.println("Server not found: " + e.getMessage());
        } catch (IOException e) {
            System.out.println("I/O error: " + e.getMessage());
        }
        sc.close();
    }
}
