package com.travelplan.trip.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplan.common.exception.BusinessRuleException;
import com.travelplan.common.exception.ResourceNotFoundException;
import com.travelplan.trip.dto.request.CreateTripRequest;
import com.travelplan.trip.dto.request.UpdateTripRequest;
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

    @Test
    void 未対応のHTTPメソッドは405を返す() throws Exception {
        mockMvc.perform(delete("/api/v1/trips"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(jsonPath("$.code").value("METHOD_NOT_ALLOWED"));
    }

    @Test
    void 存在しないpathは404を返す() throws Exception {
        mockMvc.perform(get("/api/v1/nonexistent"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    void IDを指定して旅行計画を取得できる() throws Exception {
        TripResponse response = new TripResponse(
                1L,
                "東京・京都旅行",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 5),
                "寺社巡りをする",
                OffsetDateTime.now(),
                OffsetDateTime.now());

        when(tripService.getTrip(1L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/trips/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("東京・京都旅行"));
    }

    @Test
    void 存在しないIDの取得は404を返す() throws Exception {
        when(tripService.getTrip(999L)).thenThrow(new ResourceNotFoundException("旅行計画が見つかりません"));

        mockMvc.perform(get("/api/v1/trips/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("旅行計画が見つかりません"));
    }

    @Test
    void IDが数値でない場合は400を返す() throws Exception {
        mockMvc.perform(get("/api/v1/trips/abc"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST_BODY"));
    }

    @Test
    void 正常な旅行計画更新リクエストは200を返す() throws Exception {
        UpdateTripRequest request = new UpdateTripRequest(
                "東京・京都旅行（更新）",
                LocalDate.of(2026, 9, 2),
                LocalDate.of(2026, 9, 6),
                "ホテル予約済み");

        TripResponse response = new TripResponse(
                1L,
                request.name(),
                request.startDate(),
                request.endDate(),
                request.memo(),
                OffsetDateTime.now(),
                OffsetDateTime.now());

        when(tripService.updateTrip(eq(1L), any(UpdateTripRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/v1/trips/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("東京・京都旅行（更新）"));
    }

    @Test
    void 存在しないIDの更新は404を返す() throws Exception {
        UpdateTripRequest request = new UpdateTripRequest(
                "旅行",
                LocalDate.of(2026, 9, 1),
                LocalDate.of(2026, 9, 5),
                null);

        when(tripService.updateTrip(eq(999L), any(UpdateTripRequest.class)))
                .thenThrow(new ResourceNotFoundException("旅行計画が見つかりません"));

        mockMvc.perform(put("/api/v1/trips/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("NOT_FOUND"));
    }

    @Test
    void 更新時に旅行名が空だと400とエラー詳細を返す() throws Exception {
        String invalidJson = """
                {
                  "name": "",
                  "startDate": "2026-09-01",
                  "endDate": "2026-09-05",
                  "memo": null
                }
                """;

        mockMvc.perform(put("/api/v1/trips/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
                .andExpect(jsonPath("$.errors[0].field").value("name"));
    }

    @Test
    void 更新時に終了日が開始日より前だとサービス層の例外を400として返す() throws Exception {
        String json = """
                {
                  "name": "無効な旅行",
                  "startDate": "2026-09-05",
                  "endDate": "2026-09-01",
                  "memo": null
                }
                """;

        when(tripService.updateTrip(eq(1L), any(UpdateTripRequest.class)))
                .thenThrow(new BusinessRuleException("endDate", "終了日は開始日以降の日付を指定してください"));

        mockMvc.perform(put("/api/v1/trips/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors[0].field").value("endDate"));
    }
}
