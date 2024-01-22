using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("RM_CANCEL_TRACKING")]
    public class RmCancelTracking
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(maximumLength: 50)]
        public string LocationGPS { get; set; }

        [StringLength(maximumLength: 255)]
        public string LocationText { get; set; }

        [StringLength(maximumLength: 50)]
        public string ParkingCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string ReasonCancel { get; set; }

        [StringLength(maximumLength: 255)]
        public string TripCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string CreateBy { get; set; }

        [StringLength(maximumLength: 255)]
        public string Note { get; set; }

        [StringLength(maximumLength: 255)]

        public DateTime? CreateDate { get; set; }

    }
}