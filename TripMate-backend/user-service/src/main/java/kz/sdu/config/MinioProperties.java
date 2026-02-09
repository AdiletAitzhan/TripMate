package kz.sdu.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "tripmate.minio")
public class MinioProperties {

    private String endpoint = "http://localhost:9000";
    private String accessKey = "minioadmin";
    private String secretKey = "minioadmin";
    private String bucket = "tripmate";
    /**
     * Base URL for public object links (e.g. http://localhost:9000 or https://cdn.example.com).
     * If not set, endpoint is used.
     */
    private String publicBaseUrl;
}
