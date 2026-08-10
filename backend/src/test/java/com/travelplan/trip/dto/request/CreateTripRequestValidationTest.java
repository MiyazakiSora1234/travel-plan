package com.travelplan.trip.dto.request;

import static org.assertj.core.api.Assertions.assertThat;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.time.LocalDate;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

// CreateTripRequestのBean Validation制約のテスト
class CreateTripRequestValidationTest {

    private static ValidatorFactory validatorFactory;
    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        validatorFactory = Validation.buildDefaultValidatorFactory();
        validator = validatorFactory.getValidator();
    }

    @AfterAll
    static void closeValidator() {
        validatorFactory.close();
    }

    @Test
    void 全項目が正しい場合は違反なし() {
        CreateTripRequest request = new CreateTripRequest(
                "東京・京都旅行",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 5),
                "寺社巡りをする");

        Set<ConstraintViolation<CreateTripRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void 旅行名が空だと違反になる() {
        CreateTripRequest request = new CreateTripRequest(
                "",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 5),
                null);

        Set<ConstraintViolation<CreateTripRequest>> violations = validator.validate(request);

        assertThat(violations)
                .anyMatch(v -> v.getPropertyPath().toString().equals("name"));
    }

    @Test
    void 旅行名が101文字だと違反になる() {
        CreateTripRequest request = new CreateTripRequest(
                "あ".repeat(101),
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 5),
                null);

        Set<ConstraintViolation<CreateTripRequest>> violations = validator.validate(request);

        assertThat(violations)
                .anyMatch(v -> v.getPropertyPath().toString().equals("name"));
    }

    @Test
    void 開始日が未指定だと違反になる() {
        CreateTripRequest request = new CreateTripRequest(
                "旅行",
                null,
                LocalDate.of(2026, 9, 5),
                null);

        Set<ConstraintViolation<CreateTripRequest>> violations = validator.validate(request);

        assertThat(violations)
                .anyMatch(v -> v.getPropertyPath().toString().equals("startDate"));
    }

    @Test
    void メモが2001文字だと違反になる() {
        CreateTripRequest request = new CreateTripRequest(
                "旅行",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 5),
                "あ".repeat(2001));

        Set<ConstraintViolation<CreateTripRequest>> violations = validator.validate(request);

        assertThat(violations)
                .anyMatch(v -> v.getPropertyPath().toString().equals("memo"));
    }

    @Test
    void メモが未指定でも違反なし() {
        CreateTripRequest request = new CreateTripRequest(
                "旅行",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 5),
                null);

        Set<ConstraintViolation<CreateTripRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }
}
