using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("URENCO_TRASH_CAR")]
    public class UrencoTrashCar
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(maximumLength: 255)]
        public string CarCode { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string DriverId { get; set; }
        public int? Flag { get; set; }
        [StringLength(maximumLength: 255)]
        public string Generic { get; set; }
        [StringLength(maximumLength: 255)]
        public string Group { get; set; }
        [StringLength(maximumLength: 255)]
        public string Image { get; set; }
        [StringLength(maximumLength: 255)]
        public string CarName { get; set; }
        [StringLength(maximumLength: 255)]
        public string Origin { get; set; }
        [StringLength(maximumLength: 50)]
        public string CompanyCode { get; set; }
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        [StringLength(maximumLength: 50)]
        public string LicensePlate { get; set; }
        public int? Number { get; set; }
        [StringLength(maximumLength: 255)]
        public string OwnerCode { get; set; }
        [StringLength(maximumLength: 250)]
        public string Category { get; set; }
        public int? WeightItself { get; set; }
        public int? DesignPayload { get; set; }
        public int? PayloadPulled { get; set; }
        public int? PayloadTotal { get; set; }
        [StringLength(maximumLength: 100)]
        public string SizeRegistry { get; set; }
        [StringLength(maximumLength: 100)]
        public string SizeUse { get; set; }
        public DateTime? RegistryDuration { get; set; }
        public DateTime? InsurranceDuration { get; set; }
        public DateTime? YearManufacture { get; set; }
        [StringLength(maximumLength: 1255)]
        public string Note { get; set; }
        [StringLength(maximumLength: 1000)]
        public string PositionGps { get; set; }
        [StringLength(maximumLength: 500)]
        public string PositionText { get; set; }
        public int SumDistance { get; set; }
        public string Status { get; set; }
        public string DeletedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
        public bool IsDeleted { get; set; }
        [NotMapped]
        public string sRegistryDuration { get; set; }
        [NotMapped]
        public string sInsurranceDuration { get; set; }
        [NotMapped]
        public string sYearManufacture { get; set; }
        public string Type { get; set; }
        public string QrCode { get; set; }
        public string DriverDefault { get; set; }
        public string RouteDefault  { get; set; }
        public string BranchCode { get; set; }
        public DateTime? RegistryExpirationDate { get; set; }
        public DateTime? RoadExpirationDate { get; set; }
        public DateTime? MaintenanceNextDate { get; set; }
        [NotMapped]
        public string sRegistryExpirationDate { get; set; }
        [NotMapped]
        public string sRoadExpirationDate { get; set; }
        [NotMapped]
        public string sMaintenanceNextDate { get; set; }

    }
}