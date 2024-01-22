using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("RM_ROMOOC_CURRENT_POSITION")]
    public class RmRemoocCurrentPosition
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(maximumLength: 255)]
        public string RemoocCode { get; set; }
        [StringLength(maximumLength: 255)]
        public string TractorCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string TripCode { get; set; }


        public bool Status { get; set; }


        public DateTime? PositionTime { get; set; }

        public string PositionText { get; set; }

        [StringLength(maximumLength: 255)]
        public string PositionGPS { get; set; }

        [StringLength(maximumLength: 255)]
        public string PositionParking { get; set; }
        public int? DriverId { get; set; }
    }
}