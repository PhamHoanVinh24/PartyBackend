using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("EDMS_CAT_REPO_SETTING")]
    public class EDMSCatRepoSetting
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [StringLength(100)]
        public string ReposCode { get; set; }

        [StringLength(100)]
        public string CatCode { get; set; }

        [StringLength(255)]
        public string Path { get; set; }

        [StringLength(255)]
        public string FolderId { get; set; }

        [StringLength(255)]
        public string FolderName { get; set; }
    }
}
