package kz.sdu.service;

import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import kz.sdu.config.MinioProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioService {

    private final MinioProperties minioProperties;

    public String upload(MultipartFile file, String objectName) {
        try {
            MinioClient client = MinioClient.builder()
                    .endpoint(minioProperties.getEndpoint())
                    .credentials(minioProperties.getAccessKey(), minioProperties.getSecretKey())
                    .build();

            ensureBucket(client);

            try (InputStream is = file.getInputStream()) {
                client.putObject(
                        PutObjectArgs.builder()
                                .bucket(minioProperties.getBucket())
                                .object(objectName)
                                .stream(is, file.getSize(), -1)
                                .contentType(file.getContentType() != null ? file.getContentType() : "application/octet-stream")
                                .build());
            }

            return buildPublicUrl(objectName);
        } catch (Exception e) {
            log.error("MinIO upload failed for object {}", objectName, e);
            throw new RuntimeException("Failed to upload file", e);
        }
    }

    /**
     * Upload profile photo and return its public URL.
     */
    public String uploadPhoto(MultipartFile file, UUID userId) {
        String ext = getFileExtension(file.getOriginalFilename());
        String objectName = "photos/" + userId + "/" + UUID.randomUUID() + ext;
        return upload(file, objectName);
    }

    /**
     * Returns the public URL for an object (by object name stored in DB) or for a full object path.
     */
    public String getPublicUrl(String objectName) {
        return buildPublicUrl(objectName);
    }

    private void ensureBucket(MinioClient client) {
        try {
            if (!client.bucketExists(io.minio.BucketExistsArgs.builder().bucket(minioProperties.getBucket()).build())) {
                client.makeBucket(io.minio.MakeBucketArgs.builder().bucket(minioProperties.getBucket()).build());
            }
        } catch (Exception e) {
            log.warn("Could not ensure bucket exists: {}", e.getMessage());
        }
    }

    private String buildPublicUrl(String objectName) {
        String base = minioProperties.getPublicBaseUrl() != null && !minioProperties.getPublicBaseUrl().isBlank()
                ? minioProperties.getPublicBaseUrl()
                : minioProperties.getEndpoint();
        base = base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
        return base + "/" + minioProperties.getBucket() + "/" + objectName;
    }

    private static String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) return ".jpg";
        return filename.substring(filename.lastIndexOf('.'));
    }
}
