package com.telemedicine.common.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired(required = false)
    private UserDetailsService userDetailsService;
    
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (!StringUtils.hasText(authHeader) || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            final String jwt = authHeader.substring(7);

            if (!jwtService.isTokenValid(jwt)) {
                log.warn("Invalid JWT token");
                filterChain.doFilter(request, response);
                return;
            }

            final String userEmail = jwtService.extractUsername(jwt);
            final Long userId = jwtService.extractUserId(jwt);
            final String role = jwtService.extractRole(jwt);

            if (userEmail == null || userId == null || role == null) {
                log.warn("JWT missing required claims");
                filterChain.doFilter(request, response);
                return;
            }

            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                if (userDetailsService != null) {
                    try {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

                        if (jwtService.isTokenValid(jwt, userDetails)) {
                            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            request.setAttribute("userId", userId);
                            request.setAttribute("email", userEmail);
                            request.setAttribute("role", role);

                            SecurityContextHolder.getContext().setAuthentication(authToken);
                            log.info("Authenticated with UserDetails: {} (role: {})", userEmail, role);
                        }
                    } catch (Exception e) {
                        log.warn("UserDetailsService authentication failed, falling back to stateless, message: {}", e.toString());
                        authenticateStateless(request, userEmail, userId, role);
                    }
                } else {
                    authenticateStateless(request, userEmail, userId, role);
                }
            }
        } catch (Exception e) {
            log.error("Unable to set authentication in security context", e);
        }

        filterChain.doFilter(request, response);
    }

    private void authenticateStateless(
            HttpServletRequest request,
            String userEmail,
            Long userId,
            String role) {
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                userId, null, Collections.singletonList(authority));
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        request.setAttribute("userId", userId);
        request.setAttribute("email", userEmail);
        request.setAttribute("role", role);

        SecurityContextHolder.getContext().setAuthentication(authToken);
        log.info("Authenticated stateless user: {} with role: {}", userEmail, role);
    }
}