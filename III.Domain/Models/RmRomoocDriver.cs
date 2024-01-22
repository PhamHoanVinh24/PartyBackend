using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("RM_ROMOOC_DRIVER")]
    public class RmRomoocDriver
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(maximumLength: 50)]
        public string IdFb { get; set; }

        [StringLength(maximumLength: 50)]
        public string CompanyCode { get; set; }

        [StringLength(maximumLength: 150)]
        public string Name { get; set; }

        [StringLength(maximumLength: 50)]
        public string Username { get; set; }

        [StringLength(maximumLength: 50)]
        public string Password { get; set; }

        [StringLength(maximumLength: 50)]
        public string Email { get; set; }

        [StringLength(maximumLength: 15)]
        public string Phone { get; set; }

        [StringLength(maximumLength: 255)]
        public string ProfilePicture { get; set; }

        public double? BalanceCredit { get; set; }

        public int? Active { get; set; }

        public int? TypeDriver { get; set; }
        [StringLength(maximumLength: 50)]
        public string LicensePlate { get; set; }
        [StringLength(maximumLength: 255)]
        public string TaxyType { get; set; }

        public int? IsOnline { get; set; }

        public int? IsBusy { get; set; }
        [StringLength(maximumLength: 255)]
        public string Group { get; set; }

        [StringLength(maximumLength: 50)]
        public string TypeCarYear { get; set; }

        [StringLength(maximumLength: 255)]
        public string Identification { get; set; }
        [StringLength(maximumLength: 255)]
        public string LicenseCarImage { get; set; }
        [StringLength(maximumLength: 255)]
        public string ImageCar { get; set; }
        [StringLength(maximumLength: 255)]
        public DateTime? CreatedDate { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }

        public int? UpdatedBy { get; set; }
        [StringLength(maximumLength: 100)]

        public string Emei { get; set; }
        [StringLength(maximumLength: 500)]
        public string Description { get; set; }
        [StringLength(maximumLength: 255)]
        public string Brand { get; set; }
        [StringLength(maximumLength: 2000)]
        public string VirualIntiary { get; set; }
        [StringLength(maximumLength: 4000)]
        public string Polyline { get; set; }
        [StringLength(maximumLength: 255)]
        public string StartName { get; set; }
        [StringLength(maximumLength: 255)]
        public string EndName { get; set; }
        [StringLength(maximumLength: 255)]
        public string StartNameGPS { get; set; }
        [StringLength(maximumLength: 255)]
        public string EndNameGPS { get; set; }
        [StringLength(maximumLength: 1000)]
        public string PositionGPS { get; set; }
        [StringLength(maximumLength: 500)]
        public string PositionText { get; set; }
        public DateTime? PositionTime { get; set; }
        public string Type { get; set; }
        public string CurrentChannel { get; set; }
        public string RemoocCode { get; set; }
        public string TractorCode { get; set; }
    }
}