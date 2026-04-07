import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.Writer;
import java.net.ServerSocket;
import java.net.Socket;

public class TCPServer {
    public static void main(String[] args) {
        try {
            ServerSocket serverSocket = new ServerSocket(1234);
            System.out.println("TCP Server is running...");

            Socket clientSocket = serverSocket.accept();
            System.out.println("Client connected!");

            BufferedReader reader = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
            String message = reader.readLine();
            System.out.println("Message from client: " + message);

            Writer writer = new OutputStreamWriter(clientSocket.getOutputStream());
            writer.write("Message received!\n");
            writer.flush();

            writer.close();
            reader.close();
            clientSocket.close();
            serverSocket.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}