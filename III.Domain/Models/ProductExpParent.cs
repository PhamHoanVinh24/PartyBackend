﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PRODUCT_EXP_PARENT")]
    public class ProductExpParent
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        public int? IdExpProduct { get; set; }
        public int? IdProductParent { get; set; }
        public int? IdImpProduct { get; set; }

        public int? Number { get; set; }

        [StringLength(50)]
        public string CreatedBy { get; set; }

        public DateTime CreatedTime { get; set; }

        [StringLength(50)]
        public string UpdatedBy { get; set; }

        public DateTime? UpdatedTime { get; set; }

        public bool IsDeleted { get; set; }

        [StringLength(50)]
        public string DeletedBy { get; set; }

        public DateTime? DeletedTime { get; set; }

        [StringLength(50)]
        public string DeletionToken { get; set; }
    }
}
