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

// UpdateTripRequestのBean Validation制約のテスト
class UpdateTripRequestValidationTest {

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
        UpdateTripRequest request = new UpdateTripRequest(
                "東京・京都旅行",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 5),
                "寺社巡りをする");

        Set<ConstraintViolation<UpdateTripRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }

    @Test
    void 旅行名が空だと違反になる() {
        UpdateTripRequest request = new UpdateTripRequest(
                "",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 5),
                null);

        Set<ConstraintViolation<UpdateTripRequest>> violations = validator.validate(request);

        assertThat(violations)
                .anyMatch(v -> v.getPropertyPath().toString().equals("name"));
    }

    @Test
    void 旅行名が101文字だと違反になる() {
        UpdateTripRequest request = new UpdateTripRequest(
                "あ".repeat(101),
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 5),
                null);

        Set<ConstraintViolation<UpdateTripRequest>> violations = validator.validate(request);

        assertThat(violations)
                .anyMatch(v -> v.getPropertyPath().toString().equals("name"));
    }

    @Test
    void 開始日が未指定だと違反になる() {
        UpdateTripRequest request = new UpdateTripRequest(
                "旅行",
                null,
                LocalDate.of(2026, 9, 5),
                null);

        Set<ConstraintViolation<UpdateTripRequest>> violations = validator.validate(request);

        assertThat(violations)
                .anyMatch(v -> v.getPropertyPath().toString().equals("startDate"));
    }

    @Test
    void 終了日が未指定だと違反になる() {
        UpdateTripRequest request = new UpdateTripRequest(
                "旅行",
                LocalDate.of(2026, 9, 1),
                null,
                null);

        Set<ConstraintViolation<UpdateTripRequest>> violations = validator.validate(request);

        assertThat(violations)
                .anyMatch(v -> v.getPropertyPath().toString().equals("endDate"));
    }

    @Test
    void メモが2001文字だと違反になる() {
        UpdateTripRequest request = new UpdateTripRequest(
                "旅行",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 5),
                "あ".repeat(2001));

        Set<ConstraintViolation<UpdateTripRequest>> violations = validator.validate(request);

        assertThat(violations)
                .anyMatch(v -> v.getPropertyPath().toString().equals("memo"));
    }

    @Test
    void メモが未指定でも違反なし() {
        UpdateTripRequest request = new UpdateTripRequest(
                "旅行",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 5),
                null);

        Set<ConstraintViolation<UpdateTripRequest>> violations = validator.validate(request);

        assertThat(violations).isEmpty();
    }
}
