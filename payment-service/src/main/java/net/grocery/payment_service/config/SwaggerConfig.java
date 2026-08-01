package net.grocery.payment_service.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI paymentServiceOpenAPI() {

        return new OpenAPI()

                .components(new Components())

                .info(

                        new Info()

                                .title("Payment Service API")

                                .description("Grocery Store Microservices - Payment Service")

                                .version("1.0")

                                .contact(

                                        new Contact()

                                                .name("Rahul")

                                                .email("rahul@example.com")
                                )

                                .license(

                                        new License()

                                                .name("Apache License 2.0")
                                )
                );
    }
}