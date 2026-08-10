package reco

import (
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/reco/internal/delivery/http"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/reco/internal/repository"
	"github.com/AchmadZackyGZ/fluids/server/internal/modules/reco/internal/service"
	"go.uber.org/fx"
)

// ModuleReco mendaftarkan seluruh ketergantungan modul reco ke Uber FX
var Module = fx.Options(
	fx.Provide(repository.NewRecoRepository),
	fx.Provide(service.NewRecoService),
	fx.Provide(http.NewRecoHandler),
)