using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("AD_DIVISION")]
    public class AdDivision
    {
        public AdDivision()
        {
        }

        [Key]
        [StringLength(255)]
        public string Division { get; set; }

        [StringLength(255)]
        public string DivisionDesc { get; set; }

        [StringLength(50)]
        public string UpdateTime { get; set; }
    }
}