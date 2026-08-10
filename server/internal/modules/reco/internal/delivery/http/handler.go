package http

import (
	"net/http"
	"strconv"

	"github.com/AchmadZackyGZ/fluids/server/internal/modules/reco/internal/service"
	"github.com/labstack/echo/v4"
)

type RecoHandler struct {
	service service.RecoService
}

func NewRecoHandler(service service.RecoService) *RecoHandler {
	return &RecoHandler{service: service}
}

func (h *RecoHandler) GetExplore(c echo.Context) error {
	limitStr := c.QueryParam("limit")
	limit := 20
	if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
		limit = l
	}
	// Vector dummy 128 dimensi untuk pengujian pertama
	dummyVector := make([]float32, 128)
	for i := range dummyVector {
		dummyVector[i] = 0.1
	}
	posts, err := h.service.GetExploreFeed(c.Request().Context(), dummyVector, int32(limit))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, map[string]interface{}{
		"status": "success",
		"data":   posts,
	})
}