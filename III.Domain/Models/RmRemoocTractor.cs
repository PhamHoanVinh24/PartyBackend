using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("RM_ROMOOC_TRACTOR")]
    public class RmRemoocTractor
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(maximumLength: 50)]
        public string CompanyCode { get; set; }

        public int? DriverId { get; set; }

        [StringLength(maximumLength: 255)]
        public string Name { get; set; }

        [StringLength(maximumLength: 255)]
        public string Code { get; set; }

        [StringLength(maximumLength: 255)]
        public string Group { get; set; }

        [StringLength(maximumLength: 255)]
        public string Image { get; set; }

        [StringLength(maximumLength: 255)]
        public string Origin { get; set; }

        [StringLength(maximumLength: 255)]
        public string Generic { get; set; }
        public DateTime? CreateDate { get; set; }
        public string CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public string UpdateBy { get; set; }
        public int Flag { get; set; }
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
        public DateTime? RegistryDuration { get; set; }
        public DateTime? InsurranceDuration { get; set; }
        [StringLength(maximumLength: 1255)]
        public string Note { get; set; }
        [StringLength(maximumLength: 1000)]
        public string PositionGPS { get; set; }
        [StringLength(maximumLength: 500)]
        public string PositionText { get; set; }
        public int SumDistance { get; set; }
        [StringLength(maximumLength: 500)]
        public string RomoocCode { get; set; }

    }
}