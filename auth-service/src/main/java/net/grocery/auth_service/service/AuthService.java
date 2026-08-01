package net.grocery.auth_service.service;

import net.grocery.auth_service.dto.LoginRequest;
import net.grocery.auth_service.dto.LoginResponse;
import net.grocery.auth_service.dto.RegisterRequest;
import net.grocery.auth_service.dto.RegisterResponse;

public interface AuthService {
    RegisterResponse register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
}
