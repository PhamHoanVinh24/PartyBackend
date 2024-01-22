using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace ESEIM.Models
{
    [Table("SUPPLIER_FILE")]
    public class SupplierFile
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int SupplierId { get; set; }

        [StringLength(100)]
        public string FileCode { get; set; }

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
    }
}
