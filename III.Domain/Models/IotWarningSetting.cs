using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("IOT_WARNING_SETTING")]
    public class IotWarningSetting
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string ObjType { get; set; }

        public string DeviceCode { get; set; }

        public decimal CloseBelow { get; set; }

        public decimal CloseOn { get; set; }

        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }

        public string DeletedBy { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime? DeletedTime { get; set; }

        public string Location { get; set; }
    }

    public class IotWarningSettingModel
    {
        public int Id { get; set; }

        [StringLength(100)]
        public string ObjType { get; set; }

        public string DeviceCode { get; set; }

        public decimal CloseBelow { get; set; }

        public decimal CloseOn { get; set; }
        public string Location { get; set; }
    }
}
