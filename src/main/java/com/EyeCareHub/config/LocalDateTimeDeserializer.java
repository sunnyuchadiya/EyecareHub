package com.EyeCareHub.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.deser.std.StdDeserializer;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class LocalDateTimeDeserializer extends StdDeserializer<LocalDateTime> {
    private static final DateTimeFormatter[] FORMATTERS = {
        DateTimeFormatter.ISO_LOCAL_DATE_TIME,  // 2026-03-19T14:30:00
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm"),  // 2026-03-19T14:30
        DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss"),  // 2026-03-19T14:30:00
    };

    public LocalDateTimeDeserializer() {
        super(LocalDateTime.class);
    }

    @Override
    public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getValueAsString();
        if (value == null || value.trim().isEmpty()) {
            return null;
        }

        value = value.trim();

        for (DateTimeFormatter formatter : FORMATTERS) {
            try {
                return LocalDateTime.parse(value, formatter);
            } catch (Exception e) {
                // Try next formatter
            }
        }

        throw new IOException("Unable to parse LocalDateTime: " + value);
    }
}
