using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("ZOOM_REPORT_ERROR")]
    public class ZoomReportError
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public string ErrorContent { get; set; }

        public string CreatedBy { get; set; }

        public DateTime? CreatedTime { get; set; }
    }
}