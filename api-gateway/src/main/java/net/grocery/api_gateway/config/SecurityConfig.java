//package net.grocery.api_gateway.config;
//
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.http.HttpMethod;
//import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
//import org.springframework.security.config.web.server.ServerHttpSecurity;
//import org.springframework.security.web.server.SecurityWebFilterChain;
//
//@Configuration
//@EnableWebFluxSecurity
//public class SecurityConfig {
//
//    @Bean
//    public SecurityWebFilterChain securityWebFilterChain(
//            ServerHttpSecurity http) {
//
//        return http
//                .csrf(ServerHttpSecurity.CsrfSpec::disable)
//
//                .authorizeExchange(exchanges -> exchanges
//
//                        .pathMatchers(HttpMethod.OPTIONS, "/**")
//                        .permitAll()
//
//                        .pathMatchers(
//                                "/api/auth/register",
//                                "/api/auth/login"
//                        )
//                        .permitAll()
//
//                        .pathMatchers(
//                                HttpMethod.GET,
//                                "/api/products",
//                                "/api/products/**"
//                        )
//                        .permitAll()
//
//                        .anyExchange()
//                        .authenticated()
//                )
//
//                .build();
//    }
//}
package net.grocery.api_gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(
            ServerHttpSecurity http) {

        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchanges -> exchanges
                        .anyExchange()
                        .permitAll()
                )
                .build();
    }
}