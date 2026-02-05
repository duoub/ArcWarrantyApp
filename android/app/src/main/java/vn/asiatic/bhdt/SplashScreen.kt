package vn.asiatic.bhdt

import android.app.Activity
import android.app.Dialog
import android.os.Build
import java.lang.ref.WeakReference

object SplashScreen {
    private var mSplashDialog: Dialog? = null
    private var mActivity: WeakReference<Activity>? = null

    fun show(activity: Activity, themeResId: Int) {
        mActivity = WeakReference(activity)
        activity.runOnUiThread {
            if (mActivity?.get()?.isFinishing == false) {
                mSplashDialog = Dialog(activity, themeResId).apply {
                    setContentView(R.layout.launch_screen)
                    setCancelable(false)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                        window?.let { window ->
                            window.setLayout(
                                android.view.ViewGroup.LayoutParams.MATCH_PARENT,
                                android.view.ViewGroup.LayoutParams.MATCH_PARENT
                            )
                            window.statusBarColor = android.graphics.Color.WHITE
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                window.decorView.systemUiVisibility =
                                    android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
                            }
                        }
                    }
                    show()
                }
            }
        }
    }

    fun hide() {
        mActivity?.get()?.runOnUiThread {
            mSplashDialog?.let { dialog ->
                if (dialog.isShowing) {
                    dialog.dismiss()
                }
            }
            mSplashDialog = null
        }
    }
}
