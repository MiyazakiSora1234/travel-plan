package com.travelplan.trip.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplan.common.exception.BusinessRuleException;
import com.travelplan.trip.dto.request.CreateTripRequest;
import com.travelplan.trip.dto.response.TripResponse;
import com.travelplan.trip.service.TripService;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

// TripControllerのAPIテスト（HTTP層のみを起動、Serviceはモック化）
@WebMvcTest(TripController.class)
class TripControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TripService tripService;

    @Test
    void 正常な旅行計画登録リクエストは201を返す() throws Exception {
        CreateTripRequest request = new CreateTripRequest(
                "東京・京都旅行",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 5),
                "寺社巡りをする");

        TripResponse response = new TripResponse(
                1L,
                request.name(),
                request.startDate(),
                request.endDate(),
                request.memo(),
                OffsetDateTime.now(),
                OffsetDateTime.now());

        when(tripService.createTrip(any(CreateTripRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("東京・京都旅行"));
    }

    @Test
    void 旅行名が空だと400とエラー詳細を返す() throws Exception {
        String invalidJson = """
                {
                  "name": "",
                  "startDate": "2026-09-01",
                  "endDate": "2026-09-05",
                  "memo": null
                }
                """;

        mockMvc.perform(post("/api/v1/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors[0].field").value("name"));
    }

    @Test
    void 終了日が開始日より前だとサービス層の例外を400として返す() throws Exception {
        String json = """
                {
                  "name": "無効な旅行",
                  "startDate": "2026-09-05",
                  "endDate": "2026-09-01",
                  "memo": null
                }
                """;

        when(tripService.createTrip(any(CreateTripRequest.class)))
                .thenThrow(new BusinessRuleException("endDate", "終了日は開始日以降の日付を指定してください"));

        mockMvc.perform(post("/api/v1/trips")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("endDate"));
    }

    @Test
    void 旅行計画一覧を取得できる() throws Exception {
        TripResponse response = new TripResponse(
                1L,
                "東京・京都旅行",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 5),
                "寺社巡りをする",
                OffsetDateTime.now(),
                OffsetDateTime.now());

        when(tripService.getTrips()).thenReturn(List.of(response));

        mockMvc.perform(get("/api/v1/trips"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].name").value("東京・京都旅行"));
    }

    @Test
    void 旅行計画が0件の場合は空配列を返す() throws Exception {
        when(tripService.getTrips()).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/trips"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }
}
