using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("RM_JNANA_NEWS_CAT")]
   public class RmJnanaNewsCat
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id { get; set; }

        [StringLength(maximumLength: 250)]
        public string CatCode { get; set; }


        [StringLength(maximumLength: 1000)]
        public string CatTitle { get; set; }

        [StringLength(maximumLength: 1000)]
        public string CatDescription { get; set; }

        public int? CatParentCode { get; set; }

        public int? CreatedBy { get; set; }
        public int? Update_by { get; set; }



        [StringLength(maximumLength: 1000)]
        public string CatAvarta { get; set; }
        [StringLength(maximumLength:255)]
        public string CompanyCode { get; set; }

        public DateTime? CreatedTime { get; set; }
        public DateTime? UpdateTime { get; set; }
        public int CatStatus { get; set; }
    }
}
