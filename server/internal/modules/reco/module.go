package reco

import (
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/reco/internal/delivery/http"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/reco/internal/repository"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/reco/internal/service"
	"github.com/labstack/echo/v4"
	"go.uber.org/fx"
)

// RegisterRoutes mendaftarkan rute HTTP milik modul reco ke Echo server
func RegisterRoutes(e *echo.Echo, handler *http.RecoHandler) {
	e.GET("/api/v1/reco/explore", handler.GetExplore)
}

// Module mendaftarkan seluruh ketergantungan modul reco ke Uber FX
var Module = fx.Options(
	fx.Provide(repository.NewRecoRepository),
	fx.Provide(service.NewRecoService),
	fx.Provide(http.NewRecoHandler),
	fx.Invoke(RegisterRoutes), // mendaftarkan rute HTTP milik modul reco ke Uber FX agar diterima oleh Echo server secara otomatis
)