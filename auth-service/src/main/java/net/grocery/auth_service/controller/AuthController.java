package net.grocery.auth_service.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import net.grocery.auth_service.dto.LoginRequest;
import net.grocery.auth_service.dto.LoginResponse;
import net.grocery.auth_service.dto.RegisterRequest;
import net.grocery.auth_service.dto.RegisterResponse;
import net.grocery.auth_service.security.UserPrincipal;
import net.grocery.auth_service.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private  AuthService authService;

    @PostMapping("/register")
    public RegisterResponse register(
            @Valid @RequestBody RegisterRequest request) {

        return authService.register(request);
    }

    @PostMapping("/login")
    public LoginResponse login(
            @Valid @RequestBody LoginRequest request) {

        return authService.login(request);
    }

    @GetMapping("/profile")
    public String profile(Authentication authentication) {

        System.out.println("AUTH = " + authentication);

        if(authentication == null) {
            return "Authentication is null";
        }

        return "Authenticated User = " + authentication.getName();
    }
}
