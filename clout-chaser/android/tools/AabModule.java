import com.android.aapt.ConfigurationOuterClass.Configuration;
import com.android.aapt.Resources.*;
import java.lang.String;
import java.io.*;
import java.nio.file.*;
import java.util.*;

/** Writes the proto-format manifest and resource table that bundletool needs for an AAB module.
 *  The manifest comes from apkbuild.py as a line-based tree (start/attr/end), so both builds share one definition.
 *  usage: AabModule <manifest.txt> <out dir>   (writes manifest/AndroidManifest.xml and resources.pb) */
public class AabModule {
    static final String NS = "http://schemas.android.com/apk/res/android";
    static final int[][] DENSITIES = { {160}, {240}, {320}, {480}, {640} };
    static final String[] DNAMES = { "mdpi", "hdpi", "xhdpi", "xxhdpi", "xxxhdpi" };

    public static void main(String[] a) throws Exception {
        Deque<XmlElement.Builder> stack = new ArrayDeque<>();
        XmlNode root = null;
        for (String line : Files.readAllLines(Paths.get(a[0]))) {
            String[] p = line.split("\t", -1);
            if (p[0].equals("start")) {
                XmlElement.Builder e = XmlElement.newBuilder().setName(p[1]);
                if (stack.isEmpty()) e.addNamespaceDeclaration(XmlNamespace.newBuilder().setPrefix("android").setUri(NS));
                stack.push(e);
            } else if (p[0].equals("attr")) {
                // attr <android?> <name> <resId> <type> <value>
                boolean android = p[1].equals("a");
                XmlAttribute.Builder at = XmlAttribute.newBuilder().setName(p[2]);
                if (android) at.setNamespaceUri(NS).setResourceId(Integer.parseInt(p[3]));
                String type = p[4], v = p[5];
                Item.Builder it = Item.newBuilder();
                switch (type) {
                    case "str": at.setValue(v); if (android) it.setStr(com.android.aapt.Resources.String.newBuilder().setValue(v)); break;
                    case "int": at.setValue(v); it.setPrim(Primitive.newBuilder().setIntDecimalValue(Integer.parseInt(v))); break;
                    case "hex": at.setValue("0x" + Integer.toHexString(Integer.parseInt(v))); it.setPrim(Primitive.newBuilder().setIntHexadecimalValue(Integer.parseInt(v))); break;
                    case "bool": at.setValue(v); it.setPrim(Primitive.newBuilder().setBooleanValue(java.lang.Boolean.parseBoolean(v))); break;
                    case "ref": at.setValue("@" + Integer.toHexString(Integer.parseInt(v))); it.setRef(Reference.newBuilder().setId(Integer.parseInt(v))); break;
                }
                if (android) at.setCompiledItem(it);
                stack.peek().addAttribute(at);
            } else if (p[0].equals("end")) {
                XmlElement.Builder e = stack.pop();
                XmlNode n = XmlNode.newBuilder().setElement(e).build();
                if (stack.isEmpty()) root = n; else stack.peek().addChild(n);
            }
        }
        Path out = Paths.get(a[1]);
        Files.createDirectories(out.resolve("manifest"));
        Files.write(out.resolve("manifest/AndroidManifest.xml"), root.toByteArray());

        Entry.Builder icon = Entry.newBuilder().setEntryId(EntryId.newBuilder().setId(0)).setName("ic_launcher");
        for (int i = 0; i < DNAMES.length; i++) {
            icon.addConfigValue(ConfigValue.newBuilder()
                .setConfig(Configuration.newBuilder().setDensity(DENSITIES[i][0]).setSdkVersion(4))
                .setValue(Value.newBuilder().setItem(Item.newBuilder().setFile(FileReference.newBuilder()
                    .setPath("res/mipmap-" + DNAMES[i] + "-v4/ic_launcher.png").setType(FileReference.Type.PNG)))));
        }
        ResourceTable table = ResourceTable.newBuilder().addPackage(com.android.aapt.Resources.Package.newBuilder()
            .setPackageId(PackageId.newBuilder().setId(0x7f)).setPackageName("com.cloutchaser.game")
            .addType(Type.newBuilder().setTypeId(TypeId.newBuilder().setId(1)).setName("mipmap").addEntry(icon))).build();
        Files.write(out.resolve("resources.pb"), table.toByteArray());
    }
}
