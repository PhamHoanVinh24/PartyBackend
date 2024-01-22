using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("SET_ICON_2_OBJECT")]
    public class IconManager
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]

        public int Id { get; set; }

        [StringLength(255)]
        public string IconCode { get; set; }

        [StringLength(255)]
        public string IconTitle { get; set; }
        [StringLength(255)]
        public string IconPath { get; set; }
        [StringLength(255)]
        public string ObjectCode { get; set; }
        [StringLength(255)]
        public string ExpFilterSQL { get; set; }
    }
}
