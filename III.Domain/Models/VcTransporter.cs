using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("VC_TRANSPORTER")]
    public class VcTransporter
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]

        public int Id { get; set; }
        [StringLength(maximumLength: 255)]
        public string Code { get; set; }
        public int? DriverId { get; set; }

        [StringLength(maximumLength: 50)]
        public string CompanyCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string Name { get; set; }



        [StringLength(maximumLength: 255)]
        public string Group { get; set; }

        [StringLength(maximumLength: 255)]
        public string Image { get; set; }

        [StringLength(maximumLength: 255)]
        public string Origin { get; set; }

        [StringLength(maximumLength: 255)]
        public string Generic { get; set; }

        [StringLength(maximumLength: 50)]
        public string LicensePlate { get; set; }
        public int? Number { get; set; }
        public int? YearManufacture { get; set; }
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
        public string RegistryDuration { get; set; }
        public string InsurranceDuration { get; set; }
        [StringLength(maximumLength: 1255)]
        public string Note { get; set; }
        [StringLength(maximumLength: 1000)]
        public string PositionGps { get; set; }
        [StringLength(maximumLength: 500)]
        public string PositionText { get; set; }
        public int? SumDistance { get; set; }
        [StringLength(maximumLength: 500)]
        public string RomoocCode { get; set; }
        public DateTime? CreatedTime { get; set; }
        public string CreatedBy { get; set; }
        public DateTime? UpdatedTime { get; set; }
        public string UpdatedBy { get; set; }
        public string CustomType { get; set; }
        public bool IsDeleted { get; set; }
        public int? VehicleId { get; set; }
        public string CustomerId { get; set; }
        public string TransportMethodId { get; set; }
        public int? OrgId { get; set; }
        public string DriverName { get; set; }
        public string DriverInfo { get; set; }
        public string ActiveFlag { get; set; }
        public string UserNameDriver { get; set; }
        public string LocationGps { get; set; }

    }
}