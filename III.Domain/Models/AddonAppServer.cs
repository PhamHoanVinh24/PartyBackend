using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("ADDON_APP_SERVER")]
    public class AddonAppServer
    {
        [Key,DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(50)]
        public string AppCode { get; set; }

        [StringLength(50)]
        public string AppVendorCode { get; set; }

        [StringLength(50)]
        public string ServerCode { get; set; }

        [StringLength(255)]
        public string ServerAddress { get; set; }

        [StringLength(50)]
        public string Status { get; set; }

        //public string QrCode { get; set; }

        public string Note { get; set; }
        public string Logo { get; set; }
        public string Background { get; set; }
        public string Color { get; set; }
        public string FontFamily { get; set; }
        public string FontSize { get; set; }
        public string BackgroundColor { get; set; }
        public string ButtonColor { get; set; }
        public string QrcodeColor { get; set; }
        public string TextloginColor { get; set; }
        public string PinColor { get; set; }
        [NotMapped]
        public string FontSizeTest { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public bool IsDeleted { get; set; }

    }
}