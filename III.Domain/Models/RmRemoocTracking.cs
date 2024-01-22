using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("RM_ROMOOC_TRACKING")]
    public class RmRemoocTracking
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int DriveId { get; set; }

        [StringLength(maximumLength: 50)]
        public string CompanyCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string RemoocCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string TractorCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string TripCode { get; set; }

        [StringLength(maximumLength: 1000)]
        public string Note { get; set; }

        public DateTime? StartPositionTime { get; set; }

        [StringLength(maximumLength: 255)]
        public string StartPositionText { get; set; }

        [StringLength(maximumLength: 1000)]
        public string StartPositionGPS { get; set; }
        [StringLength(maximumLength: 255)]
        public string StartPositionCode { get; set; }


        [StringLength(maximumLength: 255)]
        public string ContainerCode { get; set; }
        public DateTime? EndPositionTime { get; set; }

        [StringLength(maximumLength: 255)]
        public string EndPositionText { get; set; }

        [StringLength(maximumLength: 1000)]
        public string EndPositionGPS { get; set; }

        [StringLength(maximumLength: 255)]
        public string EndPositionCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string InitPositionCode { get; set; }
        [StringLength(maximumLength: 255)]
        public string InitPositionText { get; set; }

        [StringLength(maximumLength: 1000)]
        public string InitPositionGPS { get; set; }

        public DateTime? InitPositionTime { get; set; }
        [StringLength(maximumLength: 255)]
        public string UpdateBy { get; set; }

        [StringLength(maximumLength: 255)]
        public string CreateBy { get; set; }

        public DateTime? UpdateTime { get; set; }
        public DateTime? CreateTime { get; set; }

        [StringLength(maximumLength: 255)]
        public string Status { get; set; }
        [StringLength(maximumLength: 255)]
        public string TypeTrip { get; set; }
        [StringLength(maximumLength: 255)]
        public string MaTheoDoi { get; set; }
        public string Band { get; set; }
        public string CurrentPositionText { get; set; }
        public string CurrentPositionGPS { get; set; }
        public string Imgcontain1 { get; set; }
        public string Imgcontain2 { get; set; }

    }
}