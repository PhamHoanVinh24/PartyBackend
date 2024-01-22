using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("EDMS_WHS_QRCODE_DOCUMENT")]
    public class EDMSWhsQrCodeDocument
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string OBJ_Code { get; set; }

        [StringLength(255)]
        public string QR_Code { get; set; }

        [StringLength(255)]
        public string OBJ_Type { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public bool Flag { get; set; }
        public int? PrintNumber { get; set; }
        public int? RackPosition { get; set; }
    }
}