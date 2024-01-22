using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Http;

namespace ESEIM.Models
{
    [Table("ENTITY_MAPPING")]
    public class EntityMapping
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string PoSaleCode { get; set; }

        [StringLength(100)]
        public string PoBuyerCode { get; set; }

        [StringLength(100)]
        public string ReqCode { get; set; }

        [StringLength(100)]
        public string ProjectCode { get; set; }
    }
}