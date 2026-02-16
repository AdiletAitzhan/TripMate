package kz.sdu.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("TripMate Notification Service API")
                        .description("API отправки email-уведомлений (внутренний вызов из user-service и др.)")
                        .version("1.0"));
    }
}
