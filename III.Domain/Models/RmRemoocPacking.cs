using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("RM_ROMOOC_PACKING")]
    public class RmRemoocPacking
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(maximumLength: 50)]
        public string CompanyCode { get; set; }
        [StringLength(maximumLength: 255)]
        public string Title { get; set; }

        [StringLength(maximumLength: 2000)]
        public string GisData { get; set; }

        [StringLength(maximumLength: 255)]
        public string Image { get; set; }
        [StringLength(maximumLength: 255)]
        public string Description { get; set; }

        [StringLength(maximumLength: 255)]
        public string Owner { get; set; }

        public DateTime? CreateDate { get; set; }
        public int? CreateBy { get; set; }
        public DateTime? UpdateDate { get; set; }
        public int? UpdateBy { get; set; }
        public int Flag { get; set; }
        [StringLength(maximumLength: 500)]
        public string Address { get; set; }
        public string Icon { get; set; }
    }
}