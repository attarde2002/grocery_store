package net.grocery.auth_service.service.impl;

import lombok.RequiredArgsConstructor;
import net.grocery.auth_service.dto.LoginRequest;
import net.grocery.auth_service.dto.LoginResponse;
import net.grocery.auth_service.dto.RegisterRequest;
import net.grocery.auth_service.dto.RegisterResponse;
import net.grocery.auth_service.enums.Role;
import net.grocery.auth_service.exception.ResourceAlreadyExistsException;
import net.grocery.auth_service.repository.UserRepository;
import net.grocery.auth_service.service.AuthService;
import net.grocery.auth_service.entity.User;
import net.grocery.auth_service.service.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    @Autowired
    private  UserRepository userRepository;

    @Autowired
    private  PasswordEncoder passwordEncoder;

    @Autowired
    private  JwtService jwtService;

    @Override
    public RegisterResponse register(RegisterRequest request) {
        if(userRepository.existsByEmail(request.getEmail())){
            throw new ResourceAlreadyExistsException(
                    "Email already exists");
        }
        if(userRepository.existsByMobile(request.getMobile())){
            throw new ResourceAlreadyExistsException(
                    "Mobile already exists");
        }

        User user = new User();

        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setMobile(request.getMobile());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.CUSTOMER);
        user.setIsActive(true);

        User savedUser = userRepository.save(user);

        RegisterResponse response = new RegisterResponse();

        response.setId(savedUser.getId());
        response.setFirstName(savedUser.getFirstName());
        response.setEmail(savedUser.getEmail());
        response.setMessage("User registered successfully");

        return response;

    }

    @Override
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(
                        request.getEmail())
                .orElseThrow(() ->
                        new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtService.generateToken(user);

        LoginResponse response = new LoginResponse();

        response.setToken(token);
        response.setUserId(user.getId());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole().name());

        return response;
    }
}
