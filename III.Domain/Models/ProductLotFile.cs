using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("PRODUCT_LOT_FILE")]
    public class ProductLotFile
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(255)]
        public string ProductCode { get;set; }

        [StringLength(255)]
        public string FileCode { get; set; }

        [StringLength(50)]
        public string Type { get; set; }


        [NotMapped]
        public string RepoCode { get; set; }

        [NotMapped]
        public string FileName { get; set; }

        [NotMapped]
        public string Desc { get; set; }

        [NotMapped]
        public string NumberDocument { get; set; }

        [NotMapped]
        public string Tags { get; set; }
        [NotMapped]
        public string Url { get; set; }
    }
}
