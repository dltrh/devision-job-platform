package com.devision.job_manager_company.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMediaDisplayOrderRequest {
    @NotNull(message = "Display order is required")
    private Integer displayOrder;
}
