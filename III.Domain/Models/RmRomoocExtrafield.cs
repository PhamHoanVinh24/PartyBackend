using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("RM_ROMOOC_EXTRAFIELD")]
    public class RmRomoocExtrafield
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [StringLength(maximumLength: 255)]
        public string FieldCode { get; set; }

        [StringLength(maximumLength: 255)]
        public string FieldValue { get; set; }

        [StringLength(maximumLength: 255)]
        public string FieldType { get; set; }

        [StringLength(maximumLength: 255)]
        public string Description { get; set; }

        [StringLength(maximumLength: 50)]
        public string CompanyCode { get; set; }

        public DateTime? CreateTime { get; set; }
        public DateTime? UpdateTime { get; set; }

        public int Flag { get; set; }




    }
}