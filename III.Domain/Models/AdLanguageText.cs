using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ESEIM.Models
{
    [Table("AD_LANGUAGE_TEXT")]
    public class AdLanguageText
    {
        public AdLanguageText()
        {
        }

        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int LanguageTextId { get; set; }

        [StringLength(maximumLength: 500)]
        public string Caption { get; set; }

        [StringLength(maximumLength: 20)]
        public string GroupCaption { get; set; }
        public string Value { get; set; }

        public DateTime? CreatedDate { get; set; }
        [StringLength(50)]
        public string CreatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
        [StringLength(50)]
        public string UpdatedBy { get; set; }
        public DateTime? DeletedDate { get; set; }
        [StringLength(50)]
        public string DeletedBy { get; set; }
        public bool IsDeleted { get; set; }

        public int LanguageId { get; set; }
        [JsonIgnore]
        public virtual AdLanguage Language { get; set; }
    }
}